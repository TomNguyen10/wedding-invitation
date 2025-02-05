import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { to, subject, message } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Wedding Invitation" <${process.env.NEXT_PUBLIC_EMAIL}>`,
      to,
      subject,
      html: `<p>${message}</p>`,
    });

    return new Response(
      JSON.stringify({ message: "Email sent successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to send email.",
        error: (error as any).message,
      }),
      { status: 500 }
    );
  }
}
