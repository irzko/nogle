import imaps, { ImapSimpleOptions } from "imap-simple";
import { simpleParser, ParsedMail } from "mailparser";

interface EmailData {
  id: number;
  subject: string | null;
  from: string | null;
  date: Date | null;
  text: string | null;
  html: string | null;
}

const getAllMailImap = async (
  email: string,
  password: string,
  accessToken: string,
) => {
  const config: ImapSimpleOptions = {
    imap: {
      user: email,
      password: password,
      host: "outlook.office365.com",
      port: 993,
      tls: true,
      xoauth2: Buffer.from(
        `user=${email}\x01auth=Bearer ${accessToken}\x01\x01`,
      ).toString("base64"),
    },
  };

  try {
    const connection = await imaps.connect(config);

    await connection.openBox("INBOX");
    const searchCriteria = ["ALL"];
    const fetchOptions = {
      bodies: ["HEADER.FIELDS (SUBJECT FROM DATE)", "TEXT", ""],
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    const emailsData: EmailData[] = [];

    for (const message of messages) {
      try {
        const part = message.parts.find((p) => p.which === "");
        if (!part) {
          console.warn(
            "Không tìm thấy nội dung cho email:",
            message.attributes?.uid,
          );
          continue;
        }

        const parsedEmail: ParsedMail = await simpleParser(part.body, {
          skipImageLinks: true,
          skipHtmlToText: true,
          skipTextToHtml: true,
          skipTextLinks: true,
        });

        const emailData: EmailData = {
          id: message.attributes?.uid || 0,
          subject: parsedEmail.subject || null,
          from: parsedEmail.from?.text || null,
          date: parsedEmail.date || null,
          text: parsedEmail.text || null,
          html: parsedEmail.html || null,
        };
        emailsData.push(emailData);
      } catch (err) {
        console.warn("Lỗi khi xử lý email:", err);
        continue;
      }
    }
    return {
      status: "success",
      total: emailsData.length,
      data: emailsData,
    };
  } catch (error) {
    console.error("Error in readEmails:", error);

    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      data: [],
    };
  }
};

export default getAllMailImap;
