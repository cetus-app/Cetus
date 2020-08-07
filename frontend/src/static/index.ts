// HMR does not work for the static pages without a loaded JS/TS file
const links = document.getElementsByClassName("discord-invite") as HTMLCollectionOf<HTMLAnchorElement>;
for (let i = 0; i < links.length; i++) {
  const item = links.item(i);
  if (item) {
    item.href = process.env.discordInvite || "#";
    item.target = "_blank";
    item.rel = "noopener noreferrer";
  }
}
