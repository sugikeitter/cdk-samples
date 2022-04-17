import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class VpcStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const MY_VPC_CIDR = process.env.MY_VPC_CIDR || "10.80.0.0/16";

    const vpc = new ec2.Vpc(this, 'DemoCdkVpc01', {
        cidr: MY_VPC_CIDR,
        maxAzs: 3,
        natGateways: 1,
        subnetConfiguration: [
          {
            cidrMask: 24,
            name: 'public',
            subnetType: ec2.SubnetType.PUBLIC,
          },
          {
            cidrMask: 22,
            name: 'private',
            subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          }
        ]
     });
  }
}