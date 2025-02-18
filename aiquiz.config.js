/*
    * Give priority to one model or another in case ABCTesting is not active,
    * we can give priority to the lowest cost model or the model with fewer reported failures.
    * 
    * Cost has priority over fewerReported if both are active.
    * 
    * If `keepmodel` is true, the previously assigned model will be kept, even if
    * new priorities (cost or failure reports) are considered.
    * If `keepmodel` is false, the model assignment can change based on the current priorities.
    */
   
const aiquizConfig = {
    costPriority: false,
    fewerReportedPriority: false,
    keepmodel: true,
};

export default aiquizConfig;

