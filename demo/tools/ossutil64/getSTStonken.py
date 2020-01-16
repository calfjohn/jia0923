from aliyunsdkcore import client
from aliyunsdksts.request.v20150401 import AssumeRoleRequest

clt = client.AcsClient('LTAIDylvcxYTmvWn', 'jtwrickkxgvsL7FNkN3o0q9CrPCIXj', 'cn-hangzhou')

request = AssumeRoleRequest.AssumeRoleRequest()

request.set_RoleArn('wjdmx@1469152504387117.onaliyun.com')

request.set_RoleSessionName('henshao')

response = clt.do_action_with_exception(request)