//

module.exports = function( controller ) {

  controller.hears( [ 'show' ], 'message,direct_message', async ( bot, message ) => {

    details = message.text.split(" ");
    details.shift();

    PTOs = await controller.db.findPTO(details[0]);
    console.log(PTOs);
    text = `Showing PTOs for ${details[0]}:`
    PTOs.forEach( e => {
      start = new Date(e.start_day);
      end = new Date(e.end_day)
      text += `\n[ start: ${start.toLocaleDateString('en-US')}, end: ${end.toLocaleDateString('en-US')}]`
    });
    await bot.reply( message,text );
  });

  controller.commandHelp.push( { command: 'show', text: 'Show current PTOs' } );

}
