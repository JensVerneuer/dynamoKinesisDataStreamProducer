# dynamoKinesisDataStreamProducer

Produces kinesis data streams for inserts and updates in dynamoDB.
Transforms the items from Dynamo JSON to regular JSON before sending them into the datat stream.

In case you only want to stream to one consumer e.g. a s3 bucket you may take a look to the kinesis firehouse examples provided by AWS directly.

