// TODO import の書き方
import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_autoscaling as asg,
  aws_elasticloadbalancingv2 as elbv2,
  aws_iam as iam,
  Duration,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class CdkAutoscalingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpcName = process.env.MY_VPC_NAME;
    const ec2RoleName = process.env.MY_EC2_ROLE_NAME || '';

    // TODO vpc名をCFnテンプレート作成時に渡す
    const vpc: ec2.IVpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      vpcName: vpcName
    });

    const albSg = new ec2.SecurityGroup(this, 'SecurityGroupAlb', {
      vpc: vpc,
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    const ec2Sg = new ec2.SecurityGroup(this, 'SecurityGroupEc2', {
      vpc: vpc,
    });
    // ALBのListnerとTargetGroupの紐付けあたりでここのルールは自動で設定してくれる
    // ec2Sg.addIngressRule(ec2.Peer.securityGroupId(albSg.securityGroupId), ec2.Port.tcp(80));

    // const imageName: string = process.env.MY_IMG_NAME || '';
    // TODO インスタンスタイプは複数から選べない？というか起動テンプレート使えないの？
    // TODO 最大・最小や増減のルールは？
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      "amazon-linux-extras install nginx1",
      'sed -i".org" -e "\\/h1>$/a <h2>`ec2-metadata -h`</h2>" /usr/share/nginx/html/index.html',
      "nginx",
    );
    const targetAsg = new asg.AutoScalingGroup(this, 'Asg', {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      userData: userData,
      securityGroup: ec2Sg,
      role: iam.Role.fromRoleName(this, 'Ec2Role', ec2RoleName),
      healthCheck: asg.HealthCheck.elb({
        grace: Duration.seconds(60),
      }),
    })
    // targetAsg.scaleOnRequestCount('ScaleOnRequestCount', {targetRequestsPerMinute: 300});

    const albSubnets: ec2.SubnetSelection = {
      subnetType: ec2.SubnetType.PUBLIC,
      // subnets: [
      //   ec2.Subnet.fromSubnetId(this, 'PublicSubnetAz1', process.env.MY_PUBLIC_SUBNET_AZ1 || ''),
      //   ec2.Subnet.fromSubnetId(this, 'PublicSubnetAz2', process.env.MY_PUBLIC_SUBNET_AZ2 || ''),
      //   ec2.Subnet.fromSubnetId(this, 'PublicSubnetAz3', process.env.MY_PUBLIC_SUBNET_AZ3 || ''),
      // ],
    };
    // TODO ALB, TG
    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc: vpc,
      vpcSubnets: albSubnets,
      internetFacing: true,
      securityGroup: albSg,
    });
    const albListener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
    });
    const targets = albListener.addTargets('AlbTargetGroup', {
      port: 80,
      targets: [targetAsg]
    });
  }
}
