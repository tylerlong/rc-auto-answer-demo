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
  let count = 0;
  await pubnubExtension.subscribe(
    ['/restapi/v1.0/account/~/extension/~/telephony/sessions'],
    async (event: ExtensionTelephonySessionsEvent) => {
      if (event.body!.parties![0].status === 'Setup') {
        count += 1;
        console.log(`Received notifications for the ${count}th phone call`);
      }
      console.log(JSON.stringify(event, null, 2));
    }
  );

  await waitFor({interval: 999999999}); // don't exit
  // await rc.revoke();
};

main();
