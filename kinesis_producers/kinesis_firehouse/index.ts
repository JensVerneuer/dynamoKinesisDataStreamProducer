'use strict';
import {Firehose} from 'aws-sdk';

const firehose = new Firehose({ region: process.env.region });
const streamName: string = process.env.Stream || "";

export function handler(event: any, context: any, callback: any) {
    const records: any = event.Records;
    if(records.length > 0) {
        insertRecords(records);
    };

    function insertRecords(records: any, retryCount: number=0){
        batchPutRecords(records).then(
            (data:any)=> {
                // if request was successfull but some entries may have failed
                if(data.FailedPutCount > 0){
                    //reduce set to unsucessfull
                    let failedrecords = records.filter((el:any, i:number) => {
                        if(!!data.RequestResponses[i].ErrorCode){
                            return true;
                        }
                        return false;
                    });
                    // in case of too many retries abort
                    if(retryCount > 10){
                        callback(failedrecords, 'aborting retry failed to ofetn');
                    }
                    console.warn(failedrecords.length + ' records failed to insert. Retry ' + retryCount);
                    insertRecords(records, retryCount++);
                }
                callback(null, 'Successfully processed records.', retryCount);
            }, (err:Error) => {
                callback(err, err.stack);
        });

    }
    function batchPutRecords(records: any){
        return firehose.putRecordBatch({
            DeliveryStreamName: streamName,
            Records : records
        }).promise(); 
    }
}
