import server from "./server";

const port = 8007;
server.listen(port, () => {
  console.log(`⚡️[server]: Server is running on port ${port}`);
});
