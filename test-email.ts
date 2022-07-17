import { sendMail } from "./src/lib/sendMail";

async function main() {
  try {
    await sendMail({
      to: 'jason.matthew.rhodes@gmail.com',
      subject: 'Betterlox Test Email',
      text: 'This is the text portion',
      html: `<body>
  <h1>This is the heading of my HTML version</h1>
  <p>Here is a paragraph. <a href="https://google.com">And here is a Google link.</a></p>
  <p>Here is another paragraph after that!</p>
      </body>`
    });

    console.log("successfully sent");
  } catch (error) {
    let message = "shrug";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    console.log("Problem occurred", message);
  }
}

main();