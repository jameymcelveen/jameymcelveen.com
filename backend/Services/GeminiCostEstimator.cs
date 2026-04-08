namespace Interview.Api.Services;

public sealed class GeminiCostEstimator(IConfiguration config)
{
    private decimal InputPerMillionUsd =>
        config.GetValue("Gemini:Pricing:InputPerMillionUsd", 0.075m);

    private decimal OutputPerMillionUsd =>
        config.GetValue("Gemini:Pricing:OutputPerMillionUsd", 0.30m);

    public decimal EstimateUsd(int promptTokens, int outputTokens)
    {
        if (promptTokens < 0) promptTokens = 0;
        if (outputTokens < 0) outputTokens = 0;
        var input = promptTokens * (InputPerMillionUsd / 1_000_000m);
        var output = outputTokens * (OutputPerMillionUsd / 1_000_000m);
        return decimal.Round(input + output, 8, MidpointRounding.AwayFromZero);
    }
}
