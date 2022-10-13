export class Chain {
  id: string;
  chainName: string;
  chainId: string;
  logo: string;
  snapshotServer: string;
  rpcServer: string;
  rpcPeer: string;
  binaryName: string;
  homeDirectoryName: string;
  twitter: string;
  github: string;
  globe: string;
  denomPow: number;

  prettyChainName?: string;
  serviceName?: string;
  medium?: string;
  discord?: string;
  telegram?: string;
  blockExplorer?: string;
  coingekoCoinId?: string;
  validatorUrl?: string;
  projectOverview?: string;
  denomName!: string;
  apiChainId?: string;
  isTestnet?: boolean;
  githubRepoName?: string;
  isArchive?: boolean;
  archiveReason?: string;
  endedAt?: string;
  testnetTasksLink?: string;

  hardwareRequirements?: string = '4CPU 8RAM 200GB';
  isTendermintUnsafeResetEnabled?: boolean = true;
  isSnapshotEnabled?: boolean = true;
  isStateSyncEnabled?: boolean = true;
  isTopLevelWasmEnabled?: boolean = false;
  isSummaryEnabled?: boolean = false;
  isDecentralizationMapEnabled?: boolean = true;

  constructor(chainConfig: Partial<Chain> = {}) {
    Object.assign(this, chainConfig);
    this.serviceName = chainConfig.binaryName;
  }
}
