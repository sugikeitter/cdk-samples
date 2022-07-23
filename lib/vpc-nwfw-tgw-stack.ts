import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class VpcNwfwTgwStack extends Stack {
  public readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const MY_NWFW_TGW_VPC_CIDR = process.env.MY_NWFW_TGW_VPC_CIDR || "10.90.0.0/16";

    this.vpc = new ec2.Vpc(this, 'DemoNwfwTgwVpc', {
        cidr: MY_NWFW_TGW_VPC_CIDR,
        maxAzs: 3,
        natGateways: 2, // TODO 状況に応じて 1~3 のどれか
        subnetConfiguration: [
          {
            cidrMask: 24,
            name: 'public',
            subnetType: ec2.SubnetType.PUBLIC,
          },
          {
            cidrMask: 28,
            name: 'nwfw',
            subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          },
          {
            cidrMask: 28,
            name: 'tgw',
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          },
          {
            cidrMask: 22,
            name: 'private',
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // TODO NWFWのエンドポイントへのルート
          }
        ]
     });
  }
}
