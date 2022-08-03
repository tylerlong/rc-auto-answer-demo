import RingCentral from '@rc-ex/core';
import ExtensionTelephonySessionsEvent from '@rc-ex/core/lib/definitions/ExtensionTelephonySessionsEvent';
import PubNubExtension from '@rc-ex/pubnub';
import waitFor from 'wait-for-async';

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
});

const main = async () => {
  rc.token = {access_token: process.env.RINGCENTRAL_TOKEN};

  const pubnubExtension = new PubNubExtension();
  await rc.installExtension(pubnubExtension);
  const sub = await pubnubExtension.subscribe(
    ['/restapi/v1.0/account/~/extension/~/telephony/sessions'],
    async (event: ExtensionTelephonySessionsEvent) => {
      console.log('callee notification begin');
      console.log(JSON.stringify(event, null, 2));
      console.log('callee notification end');
    }
  );
  console.log('Subscription created:');
  console.log(JSON.stringify(sub.subscriptionInfo, null, 2));

  await waitFor({interval: 999999999}); // don't exit
  // await rc.revoke();
};

main();
