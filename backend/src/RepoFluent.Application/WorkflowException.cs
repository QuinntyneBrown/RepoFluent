namespace RepoFluent.Application;

public sealed class WorkflowException(int statusCode, string code, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;

    public string Code { get; } = code;
}
