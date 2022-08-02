import RingCentral from '@rc-ex/core';
import ExtensionTelephonySessionsEvent from '@rc-ex/core/lib/definitions/ExtensionTelephonySessionsEvent';
import PubNubExtension from '@rc-ex/pubnub';
import waitFor from 'wait-for-async';

const rc = new RingCentral({
  clientId: process.env.client_id,
  clientSecret: process.env.client_secret,
  server: 'https://platform.ringcentral.com',
});

const main = async () => {
  await rc.getToken({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: process.env.jwt_token,
  });

  const pubnubExtension = new PubNubExtension();
  await rc.installExtension(pubnubExtension);
  await pubnubExtension.subscribe(
    ['/restapi/v1.0/account/~/extension/~/telephony/sessions'],
    async (event: ExtensionTelephonySessionsEvent) => {
      console.log('caller notification begin');
      console.log(JSON.stringify(event, null, 2));
      console.log('caller notification end');
    }
  );

  await waitFor({interval: 999999999}); // don't exit
  // await rc.revoke();
};

main();
