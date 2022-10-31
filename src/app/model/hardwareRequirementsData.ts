export class HardwareRequirementsData {
  specification: string;
  hetznerServerType: string;
  contaboServerType: string;

  constructor(specification: string, hetznerServerType: string, contaboServerType: string) {
    this.specification = specification;
    this.hetznerServerType = hetznerServerType;
    this.contaboServerType = contaboServerType;
  }
}
