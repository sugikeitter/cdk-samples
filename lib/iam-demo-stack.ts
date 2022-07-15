import {
  Stack,
  StackProps,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class IamDemoStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // IAMユーザーをdemo-***という名前で権限をEC2のReadOnlyで手動で作るけど、EC2のReadOnly+起動/停止できるロール
    const role = new iam.Role(this, 'DemoRoleForEC2RunStartStop', {
      roleName: "DemoRoleForEC2RunStartStop",
      assumedBy: new iam.ArnPrincipal("arn:aws:iam::" + props.env?.account + ":user/demo-ec2-readonly"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ReadOnlyAccess"),
      ],
      inlinePolicies: {
        "ec2RunStartStop": iam.PolicyDocument.fromJson({
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "ec2:RunInstances",
                "ec2:CreateTags",
                "ec2:StartInstances",
                "ec2:StopInstances",
                "iam:ListInstanceProfiles",
                "iam:GetRole",
                "iam:PassRole"
              ],
              "Resource": "*"
            }
          ]
        })
      }
    });
    // TODO パーミッション境界
  }
}
