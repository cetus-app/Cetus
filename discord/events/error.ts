const messageCreate = (error: Error, shardId: number): void => {
  console.log(`Client error: ${error.message} on shard ${shardId}`);
};

export default messageCreate;
