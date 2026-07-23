using System.Text.Json.Serialization;

namespace RepoFluent.Domain;

[JsonConverter(typeof(JsonStringEnumConverter<CurriculumStatus>))]
public enum CurriculumStatus
{
    Received,
    Validating,
    ValidationFailed,
    Draft,
    Approved,
    Rejected,
    Published
}
