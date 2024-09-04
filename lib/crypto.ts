import { useGlobalStore } from "@/data/global-store";
import type { Participant } from "@/data/participant-store";
import {
  createMessage,
  decrypt,
  encrypt,
  readMessage,
  readSignature,
  sign,
  verify,
} from "openpgp";
import { err, ok } from "neverthrow";
import _ from "lodash";

type EncryptAndSignArgs = {
  text: string;
  recipients: Participant[];
};
export const encryptAndSign = async ({
  recipients,
  text,
}: EncryptAndSignArgs) => {
  const message = await createMessage({ text });

  const encryptionKeys = recipients.map((r) => r.publicKey);

  const privateKey = useGlobalStore.getState().myKeys.private;

  if (!privateKey) {
    return err("No private key found while encrypting message!");
  }

  const [encryptedText, signature] = await Promise.all([
    encrypt({
      message,
      encryptionKeys,
      format: "armored",
    }),
    sign({
      message,
      signingKeys: privateKey,
      detached: true,
      format: "armored",
    }),
  ]);

  return ok({
    // disabled because of https://github.com/openpgpjs/openpgpjs/issues/1546
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    encryptedText: encryptedText.toString(),
    // disabled because of https://github.com/openpgpjs/openpgpjs/issues/1546
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    signature: signature.toString(),
  });
};

type VerifySignatureArgs = {
  armoredMessage: string;
  armoredSignature: string;
  sender: Participant;
};
export const verifySignature = async ({
  armoredSignature,
  armoredMessage,
  sender,
}: VerifySignatureArgs) => {
  const decryptedMessage = await decryptText(armoredMessage);
  if (decryptedMessage.isErr()) {
    return err(decryptedMessage.error);
  }

  const [messageToVerify, signatureToVerify] = await Promise.all([
    createMessage({ text: decryptedMessage.value }),
    readSignature({ armoredSignature }),
  ]);

  const verification = await verify({
    message: messageToVerify,
    signature: signatureToVerify,
    verificationKeys: sender.publicKey,
  });

  try {
    await verification.signatures[0]?.verified; // throws on invalid signature
    return ok(true as const);
  } catch (e) {
    return err(e);
  }
};

export const decryptText = async (text: string) => {
  const privateKey = useGlobalStore.getState().myKeys.private;

  if (!privateKey) {
    return err("No private key found while decrypting message!");
  }

  const decrypted = await decrypt({
    message: await readMessage({ armoredMessage: text }),
    decryptionKeys: privateKey,
  });

  // disabled because of https://github.com/openpgpjs/openpgpjs/issues/1546
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return ok(decrypted.data.toString());
};
