const Registration = require("../models/Registration");
const FormSubmission = require("../models/FormSubmission");


const repairRegistrationIndexes = async () => {

  const repairs = [
    {
      model: Registration,
      emailKey: "teamLeader.email",

      desiredKey: {
        "teamLeader.email": 1,
        event: 1
      }
    },

    {
      model: FormSubmission,
      emailKey: "responses.email",

      desiredKey: {
        "responses.email": 1,
        event: 1
      }
    }
  ];


  for (const {
    model,
    emailKey,
    desiredKey
  } of repairs) {

    const collection = model.collection;

    const indexes = await collection.indexes();


    /*
    |--------------------------------------------------------------------------
    | REMOVE OLD EMAIL-ONLY UNIQUE INDEX
    |--------------------------------------------------------------------------
    */

    for (const index of indexes) {

      const keys = index.key || {};

      const isEmailOnlyUnique =
        index.unique === true &&
        Object.keys(keys).length === 1 &&
        keys[emailKey] === 1;


      if (
        isEmailOnlyUnique &&
        index.name !== "_id_"
      ) {

        console.log(
          `Removing legacy unique index: ${model.modelName}.${index.name}`
        );

        await collection.dropIndex(index.name);
      }
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE CORRECT EVENT-SCOPED INDEX
    |--------------------------------------------------------------------------
    */

    await collection.createIndex(
      desiredKey,
      {
        unique: true,

        ...(model.modelName === "FormSubmission"
          ? { sparse: true }
          : {})
      }
    );


    console.log(
      `✓ Registration index ready: ${model.modelName}`
    );
  }
};


module.exports = repairRegistrationIndexes;