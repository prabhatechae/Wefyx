export const ORGANIZATIONS = [
  "ABC Trading LLC",
  "Wefyx Technologies",
  "TechSolutions LLC",
  "Rentals UAE",
  "MSP Global Solutions",
  "TechGear LLC",
];

export function selectedOrganization() {
  const selected = localStorage.getItem("wefyx-organization");
  return selected && selected !== "ALL" ? selected : "";
}
