let response;

/**
 * Lambda Function to get interest for a given balance.
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {
        var currencySymbol = event.queryStringParameters.currency;
        var balance = event.queryStringParameters.balance;

        var calculatedInterest = calculateInterest(balance);
        
        
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                interest: currencySymbol + calculatedInterest
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};

/**
 * Function to calculate interest for target balance
 */
function calculateInterest(balance)
{
    var interest = 0;
    var rate = 0;
    
    //Define breaks between interest rates
    if (balance < 1000)
    {
        rate = 1;
    }
    else if (balance < 5000)
    {
        rate = 1.5;
    }
    else if (balance < 10000)
    {
        rate = 2;
    }
    else if (balance < 50000)
    {
        rate = 2.5;
    }
    else
    {
        rate = 3;
    }
    
    //Calculate interest
    interest = roundWithPrecision(balance * (rate / 100.0), 2);
    
    return interest;
}

/**
 * Convenience function to round to a given number of decimal places
 */
function roundWithPrecision(interest, dps)
{
    //Create an offset factor by raising 10 to the power equivalent to the number of decimal places
    var factor = Math.pow(10, dps);
    
    //Multiply the target number by the factor, apply rounding, then divide by the factor again
    return Math.round(factor * interest)/factor;
}
