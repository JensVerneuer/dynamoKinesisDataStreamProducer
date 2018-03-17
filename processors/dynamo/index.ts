'use strict';
import {Marshaller} from '@aws/dynamodb-auto-marshaller';
const marshaller = new Marshaller();

//recives a record and transforms the date into BI prefered format
function transformRecord(record_raw: any){
    let record = JSON.parse(Buffer.from(record_raw, 'base64').toString('utf8'));

    record = transformDate(transformJSON(record));
    
    return Buffer.from(JSON.stringify(record)).toString('base64');
}

function transformJSON (dynamoJSON:any) {
    return marshaller.unmarshallItem(dynamoJSON);
}

function transformDate(record: any){
    // regex matching date
    const regex = /\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2]\d|3[0-1])T(?:[0-1]\d|2[0-3]):[0-5]\d:[0-5]\dZ/;
    for (let property in record) {
        // if current field is a Date field tranform
        let value = record[property];
        if(regex.test(value)){
            record[property] = value.replace('Z', '').replace('T', ' ');
        }              
    }
    return record;
}
export function handler(event: any, context: any, callback: any) {
    /* Process the list of records and transform them */
    const output = event.records.map((record: any) => ({
        /* This transformation is the "identity" transformation, the data is left intact */
        recordId: record.recordId,
        result: 'Ok',
        data: transformRecord(record.data),
    }));
    console.log(`Processing completed.  Successful records ${output.length}.`);
    callback(null, { records: output });
};