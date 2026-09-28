// Runs on Node 24 without a native runtime:
// node --test --test-isolation=none mobile/__tests__/workflow-parity.cjs
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const {stripTypeScriptTypes} = require('node:module');
const parser = require(path.join(root, 'web/node_modules/@babel/parser'));

// Execute the actual component handlers with persistent hook state and a fake API.
// JSX is excluded, so this suite checks workflow behavior rather than rendering.
function harness(file, name, handlers, args = {}, overrides = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const ast = parser.parse(source, {sourceType:'module', plugins:['typescript','jsx']});
  const component = ast.program.body.find(n => n.type === 'FunctionDeclaration' && n.id.name === name);
  const ret = component.body.body.find(n => n.type === 'ReturnStatement');
  const code = source.slice(component.start, ret.start) + `return {${handlers.join(',')}}; }`;
  const state = [], calls = [], alerts = [];
  let cursor = 0;
  const context = {
    useState(initial) {
      const i = cursor++;
      if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial;
      return [state[i], value => {state[i] = typeof value === 'function' ? value(state[i]) : value;}];
    },
    useEffect() {},
    apiGet: async () => [],
    apiSend: async (...values) => {calls.push(values); return {id:42, reference:'REQ-42'};},
    apiUpload: async (...values) => {calls.push(['upload', ...values]);},
    Alert: {alert: (...values) => alerts.push(values)},
    requirementToTicket: row => row,
    ...overrides,
  };
  vm.createContext(context);
  vm.runInContext(stripTypeScriptTypes(code, {mode:'transform'}), context);
  return {calls, alerts, render() {cursor=0; return context[name](args);}};
}

test('customer confirms a staff-approved quotation using the confirmation workflow', async () => {
  const h = harness('mobile/App.tsx','TicketDetails',['selectQuote'], {route:{params:{ticket:{id:42}}}});
  await h.render().selectQuote({id:7, status:'STAFF_APPROVED', vendorName:'Partner', amount:120});
  assert.equal(h.calls[0][0], '/requirements/42/quotations/7/confirm');
  assert.equal(h.calls[0][2].decision, 'CONFIRM');
});

test('legacy shared quotations retain their supported selection endpoint', async () => {
  const h = harness('mobile/App.tsx','TicketDetails',['selectQuote'], {route:{params:{ticket:{id:42}}}});
  await h.render().selectQuote({id:7, status:'SHARED_WITH_CUSTOMER'});
  assert.equal(h.calls[0][0], '/requirements/42/quotations/7/select');
});

test('failed photo upload retries against the saved requirement without creating another', async () => {
  let uploads = 0;
  const h = harness('mobile/App.tsx','BookSupport',['submit','setTitle','setDescription','setImages'], {navigation:{goBack(){}}}, {
    apiUpload: async () => {if (++uploads === 1) throw Error('Upload interrupted');},
  });
  let form = h.render(); form.setTitle('Network issue'); form.setDescription('Cannot connect'); form.setImages([{uri:'file:///photo.jpg'}]);
  await h.render().submit(); await h.render().submit();
  assert.equal(h.calls.filter(c => c[0] === '/requirements').length, 1);
  assert.equal(uploads, 2);
  assert.equal(h.calls[0][2].priority, 'Medium');
  assert.equal(h.calls[0][2].quotationRequested, true);
});

test('employee can accept a submitted requirement before review', async () => {
  const h = harness('employee-mobile/App.tsx','TicketsPage',['update','setSelected'], {items:[],reload:async()=>{}});
  h.render().setSelected({id:42,status:'SUBMITTED'});
  await h.render().update('accept');
  assert.equal(h.calls[0][0], '/requirements/42/accept');
  assert.equal(h.calls[0][1], 'PATCH');
});

test('employee revision requires feedback and sends the individual quotation review', async () => {
  const h = harness('employee-mobile/App.tsx','TicketsPage',['reviewQuote','setSelected','setNotes'], {items:[],reload:async()=>{}});
  h.render().setSelected({id:42});
  await h.render().reviewQuote({id:7}, 'REQUEST_REVISION');
  assert.equal(h.calls.length, 0);
  h.render().setNotes('Include installation');
  await h.render().reviewQuote({id:7}, 'REQUEST_REVISION');
  assert.equal(h.calls[0][0], '/requirements/42/quotations/7/review');
  assert.equal(h.calls[0][2].notes, 'Include installation');
});

test('vendor must give a decline reason and can accept an invitation', async () => {
  const h = harness('vendor-mobile/App.tsx','OrdersPage',['update','setSelected'], {items:[],reload:async()=>{}});
  h.render().setSelected({id:42});
  await h.render().update('decline');
  assert.equal(h.calls.length,0);
  await h.render().update('accept');
  assert.equal(h.calls[0][0],'/requirements/42/vendor-decision');
  assert.equal(h.calls[0][2].accepted,true);
});

test('vendor rejects negative amounts and fractional delivery days', async () => {
  const h = harness('vendor-mobile/App.tsx','OrdersPage',['update','setSelected','setQuoteAmount','setLeadTimeDays'], {items:[],reload:async()=>{}});
  let form=h.render(); form.setSelected({id:42}); form.setQuoteAmount('-10'); form.setLeadTimeDays('2');
  await h.render().update('quote'); assert.equal(h.calls.length,0);
  form=h.render(); form.setQuoteAmount('100'); form.setLeadTimeDays('1.5');
  await h.render().update('quote'); assert.equal(h.calls.length,0);
  h.render().setLeadTimeDays('2'); await h.render().update('quote');
  assert.equal(h.calls[0][0],'/requirements/42/quotations/submit');
});

test('customer notification opens the referenced requirement and marks it read', async () => {
  const navigations=[];
  const h=harness('mobile/App.tsx','Notifications',['open'], {navigation:{navigate:(...args)=>navigations.push(args)}}, {apiGet:async()=>({id:42})});
  await h.render().open({id:3,requirementId:42});
  assert.equal(h.calls[0][0],'/notifications/3/read');
  assert.equal(navigations[0][0],'TicketDetails');
  assert.equal(navigations[0][1].ticket.id,42);
});

test('photo uploads use authenticated multipart files without a JSON content type', async () => {
  const source=fs.readFileSync(path.join(root,'mobile/src/api.ts'),'utf8');
  const ast=parser.parse(source,{sourceType:'module',plugins:['typescript']});
  const code=ast.program.body.filter(n=>n.type !== 'ImportDeclaration').map(n=>source.slice(n.start,n.end)).join('\n').replace(/export /g,'');
  const calls=[];
  const context={
    __DEV__:true, Platform:{OS:'android'},
    NetInfo:{fetch:async()=>({isConnected:true})},
    Keychain:{getGenericPassword:async()=>({password:'test-session'})},
    FormData:class { fields=[]; append(...args){this.fields.push(args);} },
    fetch:async(...args)=>{calls.push(args); return {ok:true,status:201,json:async()=>[]};},
  };
  vm.createContext(context); vm.runInContext(stripTypeScriptTypes(code,{mode:'transform'}),context);
  await context.apiUpload('/requirements/42/attachments',[{uri:'file:///photo.jpg',fileName:'photo.jpg',type:'image/jpeg'}]);
  assert.equal(calls[0][0],'http://10.0.2.2:8080/api/requirements/42/attachments');
  assert.equal(calls[0][1].headers.Authorization,'Bearer test-session');
  assert.equal(calls[0][1].headers['Content-Type'],undefined);
  assert.equal(calls[0][1].body.fields[0][0],'files');
  assert.equal(calls[0][1].body.fields[0][1].uri,'file:///photo.jpg');
});
