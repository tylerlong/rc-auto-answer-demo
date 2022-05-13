import RingCentral from '@rc-ex/core';
import {
  CallSessionObject,
  ExtensionTelephonySessionsEvent,
} from '@rc-ex/core/lib/definitions';
import PubNubExtension from '@rc-ex/pubnub';
import waitFor from 'wait-for-async';

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});

const main = async () => {
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME!,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD!,
  });

  const r = await rc.post('/restapi/v1.0/account/~/telephony/conference', {});
  const conferenceSession = (r.data as any).session as CallSessionObject;
  console.log(JSON.stringify(conferenceSession, null, 2));

  const pubnubExtension = new PubNubExtension();
  await rc.installExtension(pubnubExtension);
  await pubnubExtension.subscribe(
    ['/restapi/v1.0/account/~/extension/~/telephony/sessions'],
    async (event: ExtensionTelephonySessionsEvent) => {
      console.log(JSON.stringify(event, null, 2));
      const telephonySessionId = event.body!.telephonySessionId!;
      const parties = event.body!.parties!;
      for (const party of parties) {
        if (
          party.direction !== 'Inbound' ||
          party.status?.code !== 'Proceeding'
        ) {
          continue;
        }
        const partyId = party.id;
        const callParty = await rc
          .restapi()
          .account()
          .telephony()
          .sessions(conferenceSession.id)
          .parties()
          .bringIn()
          .post({
            telephonySessionId,
            partyId,
          });
        console.log(JSON.stringify(callParty, null, 2));
        break;
      }
    }
  );

  await waitFor({interval: 200000});
  await rc.revoke();
};

main();
