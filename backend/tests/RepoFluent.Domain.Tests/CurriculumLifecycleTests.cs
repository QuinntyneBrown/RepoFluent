using RepoFluent.Domain;

namespace RepoFluent.Domain.Tests;

public sealed class CurriculumLifecycleTests
{
    [Fact]
    public void ValidPackageCanAdvanceToDraft()
    {
        var lifecycle = CurriculumLifecycle.Receive(Guid.NewGuid(), "author");

        lifecycle.BeginValidation();
        lifecycle.CompleteValidation(hasBlockingIssues: false);

        Assert.Equal(CurriculumStatus.Draft, lifecycle.Status);
    }

    [Fact]
    public void BlockingValidationIssuesPreventADraft()
    {
        var lifecycle = CurriculumLifecycle.Receive(Guid.NewGuid(), "author");

        lifecycle.BeginValidation();
        lifecycle.CompleteValidation(hasBlockingIssues: true);

        Assert.Equal(CurriculumStatus.ValidationFailed, lifecycle.Status);
    }

    [Fact]
    public void AuthorCannotApproveTheirOwnPackage()
    {
        var lifecycle = CurriculumLifecycle.Receive(Guid.NewGuid(), "author");
        lifecycle.BeginValidation();
        lifecycle.CompleteValidation(hasBlockingIssues: false);

        var exception = Assert.Throws<CurriculumLifecycleException>(() =>
            lifecycle.Review("author", isApproved: true));

        Assert.Contains("cannot approve", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(CurriculumStatus.Draft, lifecycle.Status);
    }

    [Fact]
    public void PublishingIsIdempotentAfterApproval()
    {
        var lifecycle = CurriculumLifecycle.Receive(Guid.NewGuid(), "author");
        lifecycle.BeginValidation();
        lifecycle.CompleteValidation(hasBlockingIssues: false);
        lifecycle.Review("reviewer", isApproved: true);
        var versionId = Guid.NewGuid();

        var firstResult = lifecycle.Publish(versionId);
        var duplicateResult = lifecycle.Publish(Guid.NewGuid());

        Assert.Equal(versionId, firstResult);
        Assert.Equal(versionId, duplicateResult);
        Assert.Equal(CurriculumStatus.Published, lifecycle.Status);
    }

    [Fact]
    public void UnapprovedDraftCannotBePublished()
    {
        var lifecycle = CurriculumLifecycle.Receive(Guid.NewGuid(), "author");
        lifecycle.BeginValidation();
        lifecycle.CompleteValidation(hasBlockingIssues: false);

        Assert.Throws<CurriculumLifecycleException>(() => lifecycle.Publish(Guid.NewGuid()));
        Assert.Equal(CurriculumStatus.Draft, lifecycle.Status);
    }
}
