namespace RepoFluent.Domain;

public sealed class CurriculumLifecycle
{
    private CurriculumLifecycle(
        Guid id,
        string authorId,
        CurriculumStatus status,
        string? reviewerId,
        Guid? publishedVersionId)
    {
        Id = id;
        AuthorId = authorId;
        Status = status;
        ReviewerId = reviewerId;
        PublishedVersionId = publishedVersionId;
    }

    public Guid Id { get; }

    public string AuthorId { get; }

    public CurriculumStatus Status { get; private set; }

    public string? ReviewerId { get; private set; }

    public Guid? PublishedVersionId { get; private set; }

    public static CurriculumLifecycle Receive(Guid id, string authorId) =>
        new(id, authorId, CurriculumStatus.Received, null, null);

    public static CurriculumLifecycle Rehydrate(
        Guid id,
        string authorId,
        CurriculumStatus status,
        string? reviewerId,
        Guid? publishedVersionId) => new(id, authorId, status, reviewerId, publishedVersionId);

    public void BeginValidation()
    {
        Require(CurriculumStatus.Received, "Only a received package can begin validation.");
        Status = CurriculumStatus.Validating;
    }

    public void CompleteValidation(bool hasBlockingIssues)
    {
        Require(CurriculumStatus.Validating, "Only a validating package can complete validation.");
        Status = hasBlockingIssues ? CurriculumStatus.ValidationFailed : CurriculumStatus.Draft;
    }

    public void Review(string reviewerId, bool isApproved, bool canReviewOwnPackage = false)
    {
        Require(CurriculumStatus.Draft, "Only a valid draft can be reviewed.");
        if (!canReviewOwnPackage && string.Equals(AuthorId, reviewerId, StringComparison.Ordinal))
        {
            throw new CurriculumLifecycleException("An author cannot approve their own package.");
        }

        ReviewerId = reviewerId;
        Status = isApproved ? CurriculumStatus.Approved : CurriculumStatus.Rejected;
    }

    public Guid Publish(Guid publishedVersionId)
    {
        if (Status == CurriculumStatus.Published && PublishedVersionId is { } existingVersionId)
        {
            return existingVersionId;
        }

        Require(CurriculumStatus.Approved, "Only an approved draft can be published.");
        PublishedVersionId = publishedVersionId;
        Status = CurriculumStatus.Published;
        return publishedVersionId;
    }

    private void Require(CurriculumStatus expected, string message)
    {
        if (Status != expected)
        {
            throw new CurriculumLifecycleException(message);
        }
    }
}
