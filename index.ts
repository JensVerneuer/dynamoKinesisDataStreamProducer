'use strict';

import {Marshaller} from '@aws/dynamodb-auto-marshaller';
import {Kinesis} from 'aws-sdk';

const kinesis = new Kinesis({ region: 'eu-central-1' }); // todo move to environment vars
const streamName = 'page_2_bi'; // todo move to environment vars
const marshaller = new Marshaller();

export function handler(event: any, context: any, callback: any) {
    const updatedItems = getNewAndUpdatedRecords(event.Records);
    let request: any;
    if ( updatedItems.length > 0) {
        request = kinesis.putRecords({
            Records : updatedItems,
            StreamName : streamName,
        }).promise();
        request.then(
            (data: any) => {
                // we may have here errored messages which would need to be processed again
                // todo: check if all values are processed and retry the not successfull ones maybe by pushing them 
                // to a seperate queue 
                callback(null, 'Successfully processed and inserted ' + updatedItems.length + ' records');
            }, (err: any) => {
                callback(err);
        });
    } else {
        // if there is no records to insert, we stop execution here
        callback(null, 'no records processed');
    }
}
// todo: create interface for data provider and move following code to a seperate Dynamo provider class
function getNewAndUpdatedRecords(records: any) {
    return prepareKinesisUpdate(
        records.filter((record: any) => {
            return record.eventName === 'INSERT' || record.eventName === 'MODIFY';
        }));
}
function prepareKinesisUpdate(items: any): any {
    const records: any = [];
    items.forEach((item: any) => {
        // construct partition key, this strategy of partitioning may not be the best way
        // for all use cases
        let partitionKey = JSON.stringify(item.dynamodb.Keys).substring(0, 256);
        // pushing the updates to the kinesis records array after transforming them from
        // dynamoDB json to normal js JSON. Record in Kinesis are base64 encoded strings.
        // the AWS SDK expects a string or buffer. Encoding is done on SDK side.
        //
        records.push({
            Data: JSON.stringify(marshaller.unmarshallItem(item.dynamodb.NewImage)),
            PartitionKey: partitionKey,
         });
    });

    return records;
}
