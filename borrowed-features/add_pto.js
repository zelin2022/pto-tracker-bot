//
require('any-date-parser');
const { v4: uuidv4 } = require( 'uuid' );


module.exports = function( controller ) {

  let ptoFormatHelp = async function  (bot, msg){
    await bot.reply(msg, "Invalid PTO format\nTo enter a PTO:\npto date\npto start_date - end_date");
  }

  controller.hears( [ 'add', 'new', 'create', 'pto', 'PTO' ], 'message,direct_message', async ( bot, message ) => {

    details = message.text.split(" ");
    details.shift();

    user = message.personEmail;

    // let user = message.
    if ( ['other', 'others'].includes(details[0]) ){
      // set PTO for others (person must be in room)
    }

    if (details.includes('-')){
      // date range
      i = details.indexOf('-');
      startDate = Date.fromString(details.slice(0, i).join(' '));
      endDate = Date.fromString(details.slice(i+1).join(' '));
      if (isNaN(startDate) || isNaN(endDate))
      {
        ptoFormatHelp(bot, message);
        return;
      }

    }
    else {
      // single date
      singleDayString = details.join(' ');
      let theDate = Date.fromString(singleDayString);
      if (isNaN(theDate)){
        ptoFormatHelp(bot, message);
        return;
      }
      startDate = theDate;
      endDate = theDate;
    }
    uuid = uuidv4();

    await controller.db.insertPTO(user, {start:startDate.getTime(), end:endDate.getTime()}, uuid)


    await bot.reply( message,`PTO entered:
      user: ${user}
      start: ${startDate.toLocaleDateString('en-US')}
      end: ${endDate.toLocaleDateString('en-US')}
      id: ${uuid}` );

  });

  controller.commandHelp.push( { command: 'add', text: 'Add a new PTO!' } );
}
