const MongoClient = require("mongodb");
Object.defineProperty(exports, "__esModule", { value: true });
exports.PTOMongoDB = void 0;
class PTOMongoDB{

  constructor(url){
    const MongoClient = require("mongodb").MongoClient;

    this.client = new MongoClient(url);
    this.client.connect();
    this.db = this.client.db("PTO-Tracker");
    this._pto = this.db.collection("PTOs");
    this._group = this.db.collection("groups");
  }

  insertPTO(user, range, uuid){
    console.log(range);
    this._pto.insertOne(
      {
        user: user,
        start_day: range.start,
        end_day: range.end,
        uuid: uuid
      }
    );
    console.log("inserted")
  }

  async findPTO(user){
    return await this._pto.find( {user: user} ).toArray();
  }





}
exports.PTOMongoDB = PTOMongoDB;
