package com.wefyx.support.catalog;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class CatalogSeedData {
    private record Seed(String code, String name, String specification, String category, String brand,
                        String image, long buyPrice, long rentalPrice, int stock, boolean featured,
                        boolean rentable) {}

    @Bean
    CommandLineRunner seedCatalog(CatalogProductRepository products) {
        return args -> catalog().forEach(seed -> upsert(products, seed));
    }

    private static List<Seed> catalog() {
        return List.of(
            s("dell-latitude-5550","Dell Latitude 5550 Business Laptop","15.6-inch | Intel Core i7 | 16GB | 512GB SSD","Laptops","Dell","product-dell-latitude-5550.png",3899,199,24,true,true),
            s("macbook-air-m3","Apple MacBook Air M3","13.6-inch | Apple M3 | 8GB | 256GB SSD","Laptops","Apple","product-macbook-air-m3.png",4299,249,16,true,true),
            s("dell-monitor-p2723d","Dell P2723DE 27-inch QHD USB-C Monitor","27-inch | QHD | IPS | USB-C Hub","Monitors","Dell","product-dell-p2723de.png",1399,89,34,true,true),
            s("hp-pro-tower-400-g9","HP Pro Tower 400 G9","Intel Core i5 | 16GB | 512GB SSD","Desktops","HP","product-hp-pro-tower-400-g9.png",2699,159,12,true,true),
            s("thinkpad-t14","Lenovo ThinkPad T14 Gen 4","14-inch | Ryzen 7 | 16GB | 512GB SSD","Laptops","Lenovo","product-lenovo-thinkpad-t14-gen4.png",4199,199,20,true,true),
            s("iphone-15-pro","Apple iPhone 15 Pro","6.1-inch | 256GB | Titanium","Mobility","Apple","product-iphone-15-pro.png",3999,299,10,true,true),
            s("canon-mf446dw","Canon imageCLASS MF446dw","Mono laser | Print | Scan | Copy | Fax","Printers","Canon","product-canon-mf446dw.png",1299,199,9,true,true),
            s("cisco-2960x","Cisco Catalyst 2960X","24-port | Gigabit | Managed","Networking","Cisco","product-cisco-catalyst-2960x.png",2899,129,13,true,true),
            s("unifi-6-pro","Ubiquiti UniFi 6 Pro","Dual-band Wi-Fi 6 | PoE access point","Networking","Ubiquiti","product-ubiquiti-unifi-6-pro.png",699,99,28,true,true),
            s("hikvision-4mp","Hikvision 4MP Turret Camera","4MP | PoE | IP67 | Night vision","Security","Hikvision","product-hikvision-4mp-turret.png",349,59,38,true,true),
            s("epson-fh52","Epson EB-FH52 Projector","4000 lumens | Full HD | Wireless","Projectors","Epson","product-epson-eb-fh52.png",3499,199,8,true,true),
            s("jabra-evolve2-65","Jabra Evolve2 65","Wireless stereo headset | Bluetooth | Boom mic","Accessories","Jabra","product-jabra-evolve2-65.png",699,49,31,true,true),
            s("synology-ds923","Synology DS923+","4-bay business network storage","Servers","Synology","product-synology-ds923-plus.png",2499,249,7,true,true),
            s("apc-ups-1500","APC Smart-UPS 1500VA","Line-interactive enterprise UPS","Power","APC","product-apc-smart-ups-1500.png",2199,199,11,true,true),
            s("microsoft-365","Microsoft 365 Business","One-year business productivity license","Software","Microsoft","product-microsoft-365-business.png",599,39,100,true,false),

            s("dell-poweredge-r760","Dell PowerEdge R760","2U rack server | Dual-socket | Enterprise compute","Servers","Dell","product-dell-poweredge-r760.png",28999,1899,4,true,true),
            s("hpe-proliant-dl380-gen11","HPE ProLiant DL380 Gen11","2U rack server | Scalable compute | Redundant power","Servers","HPE","product-hpe-proliant-dl380-gen11.png",31999,2099,3,true,true),
            s("lenovo-thinksystem-sr650-v3","Lenovo ThinkSystem SR650 V3","2U rack server | Enterprise virtualization","Servers","Lenovo","product-lenovo-thinksystem-sr650-v3.png",27999,1799,3,false,true),
            s("synology-ds1522-plus","Synology DS1522+","5-bay business NAS | Expandable storage","Servers","Synology","product-synology-ds1522-plus.png",2899,249,8,false,true),
            s("qnap-ts-464","QNAP TS-464","4-bay business NAS | 2.5GbE","Servers","QNAP","product-qnap-ts-464.png",2399,199,10,false,true),
            s("fortinet-fortigate-100f","Fortinet FortiGate 100F","Next-generation firewall | SD-WAN appliance","Security","Fortinet","product-fortinet-fortigate-100f.png",8999,599,6,true,true),
            s("cisco-catalyst-9300-48p","Cisco Catalyst 9300-48P","48-port PoE+ enterprise access switch","Networking","Cisco","product-cisco-catalyst-9300-48p.png",12999,799,8,true,true),
            s("aruba-cx-6200f-48g","Aruba CX 6200F 48G","48-port managed enterprise switch","Networking","Aruba","product-aruba-cx-6200f-48g.png",7499,499,9,false,true),
            s("ubiquiti-dream-machine-pro","Ubiquiti Dream Machine Pro","Security gateway | Controller | 10G SFP+","Networking","Ubiquiti","product-ubiquiti-dream-machine-pro.png",1799,149,14,true,true),
            s("tplink-omada-sg3452p","TP-Link Omada SG3452P","48-port PoE+ managed switch","Networking","TP-Link","product-tplink-omada-sg3452p.png",2699,179,12,false,true),

            s("surface-laptop-6","Microsoft Surface Laptop 6","13.5-inch | Intel Core Ultra 7 | 16GB | 512GB","Laptops","Microsoft","product-surface-laptop-6.png",5299,299,12,true,true),
            s("hp-elitebook-840-g10","HP EliteBook 840 G10","14-inch | Intel Core i7 | 16GB | 512GB","Laptops","HP","product-hp-elitebook-840-g10.png",4599,249,14,false,true),
            s("asus-expertbook-b5","ASUS ExpertBook B5","14-inch | Intel Core i7 | 16GB | 512GB","Laptops","ASUS","product-asus-expertbook-b5.png",3999,229,11,false,true),
            s("dell-optiplex-7010-sff","Dell OptiPlex 7010 SFF","Intel Core i7 | 16GB | 512GB SSD","Desktops","Dell","product-dell-optiplex-7010-sff.png",3199,179,16,false,true),
            s("lenovo-thinkcentre-m90q-gen4","Lenovo ThinkCentre M90q Gen 4","Tiny PC | Intel Core i7 | 16GB | 512GB","Desktops","Lenovo","product-lenovo-thinkcentre-m90q-gen4.png",3499,189,18,false,true),
            s("lg-ultrafine-27up850-w","LG UltraFine 27UP850-W","27-inch | 4K UHD | IPS | USB-C","Monitors","LG","product-lg-ultrafine-27up850-w.png",1699,99,20,false,true),

            s("logitech-mx-keys-s","Logitech MX Keys S","Full-size wireless illuminated keyboard","Accessories","Logitech","product-logitech-mx-keys-s.png",449,29,45,false,true),
            s("logitech-mx-master-3s","Logitech MX Master 3S","Ergonomic wireless productivity mouse","Accessories","Logitech","product-logitech-mx-master-3s.png",399,29,42,true,true),
            s("poly-voyager-focus-2","Poly Voyager Focus 2","Wireless ANC headset | Charging stand","Accessories","Poly","product-poly-voyager-focus-2.png",899,59,25,false,true),
            s("dell-wd22tb4-dock","Dell WD22TB4 Thunderbolt Dock","Thunderbolt 4 | 180W adapter | Multi-display","Accessories","Dell","product-dell-wd22tb4-dock.png",999,69,30,false,true),
            s("hp-laserjet-4103fdw","HP LaserJet Pro MFP 4103fdw","Mono laser | Print | Scan | Copy | Fax","Printers","HP","product-hp-laserjet-4103fdw.png",1899,139,15,true,true),
            s("epson-ecotank-l15150","Epson EcoTank L15150","A3+ ink tank | Print | Scan | Copy | Fax","Printers","Epson","product-epson-ecotank-l15150.png",3399,199,9,false,true),
            s("zebra-zd421","Zebra ZD421 Label Printer","Direct thermal | USB | Ethernet","Printers","Zebra","product-zebra-zd421.png",1599,119,14,false,true),
            s("ricoh-fi-8170","Ricoh fi-8170 Document Scanner","Duplex sheet-fed | 70 ppm | USB 3.2","Printers","Ricoh","product-ricoh-fi-8170.png",3299,199,8,false,true),
            s("brother-mfc-l9570cdw","Brother MFC-L9570CDW","Color laser | Print | Scan | Copy | Fax","Printers","Brother","product-brother-mfc-l9570cdw.png",3899,249,6,false,true),

            s("axis-p3265-lv","Axis P3265-LV Dome Camera","2MP | Lightfinder | IR | PoE","Security","Axis","product-axis-p3265-lv.png",1499,99,20,false,true),
            s("hikvision-ds-k1t341amf","Hikvision DS-K1T341AMF","Face recognition | Card reader | Access control","Security","Hikvision","product-hikvision-ds-k1t341amf.png",1099,79,18,false,true),
            s("logitech-rally-bar","Logitech Rally Bar","All-in-one 4K video conferencing appliance","Meeting Rooms","Logitech","product-logitech-rally-bar.png",5499,349,7,true,true),
            s("poly-studio-x52","Poly Studio X52","4K all-in-one video conferencing bar","Meeting Rooms","Poly","product-poly-studio-x52.png",6299,399,6,false,true),
            s("samsung-qm65b","Samsung QM65B 65-inch Display","65-inch | 4K UHD | Commercial signage","Monitors","Samsung","product-samsung-qm65b.png",4499,299,8,false,true),
            s("apc-srt3000xli","APC Smart-UPS SRT 3000VA","Online double-conversion rack/tower UPS","Power","APC","product-apc-srt3000xli.png",6499,399,9,true,true),
            s("eaton-9px-3000i","Eaton 9PX 3000i","Online rack/tower UPS | LCD | 3000VA","Power","Eaton","product-eaton-9px-3000i.png",5999,379,7,false,true),
            s("seagate-exos-x18-16tb","Seagate Exos X18 16TB","3.5-inch enterprise SATA hard drive","Storage","Seagate","product-seagate-exos-x18-16tb.png",1299,89,25,false,false),
            s("wd-ultrastar-hc550-18tb","WD Ultrastar DC HC550 18TB","3.5-inch enterprise SATA hard drive","Storage","Western Digital","product-wd-ultrastar-hc550-18tb.png",1699,109,20,false,false),
            s("windows-server-2025-standard","Microsoft Windows Server 2025 Standard","16-core commercial server operating system license","Software","Microsoft","product-windows-server-2025-standard.png",3199,199,100,false,false)
        );
    }

    private static Seed s(String code, String name, String specification, String category, String brand,
                          String image, long buyPrice, long rentalPrice, int stock, boolean featured,
                          boolean rentable) {
        return new Seed(code, name, specification, category, brand,
            "/images/catalog/" + image.replace(".png", ".webp"), buyPrice, rentalPrice, stock, featured, rentable);
    }

    private static void upsert(CatalogProductRepository repository, Seed seed) {
        var existing = repository.findByCodeIgnoreCase(seed.code());
        var product = existing.orElseGet(CatalogProduct::new);
        product.setCode(seed.code());
        product.setName(seed.name());
        product.setSpecification(seed.specification());
        product.setCategory(seed.category());
        product.setBrand(seed.brand());
        product.setVendor("Wefyx Technologies");
        product.setImageUrl(seed.image());
        product.setDescription(seed.specification());
        product.setFeatured(seed.featured());
        product.setRentable(seed.rentable());

        if (existing.isEmpty()) {
            product.setBuyPrice(BigDecimal.valueOf(seed.buyPrice()));
            product.setRentalPrice(BigDecimal.valueOf(seed.rentalPrice()));
            product.setStockQuantity(seed.stock());
            product.setActive(true);
            product.setPurchasable(true);
        } else {
            if (product.getBuyPrice() == null) product.setBuyPrice(BigDecimal.valueOf(seed.buyPrice()));
            if (product.getRentalPrice() == null) product.setRentalPrice(BigDecimal.valueOf(seed.rentalPrice()));
            if (product.getStockQuantity() == null) product.setStockQuantity(seed.stock());
        }
        repository.save(product);
    }
}
