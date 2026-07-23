namespace RepoFluent.Application;

public static class PackagePresenter
{
    public static Package ForReview(Package package) =>
        package with
        {
            Assessments = (package.Assessments ?? [])
                .Select(assessment => assessment with
                {
                    Pools = (assessment.Pools ?? [])
                        .Select(pool => pool with
                        {
                            Items = (pool.Items ?? [])
                                .Select(item => item with
                                {
                                    Answer = item.Answer with { Value = null }
                                })
                                .ToArray()
                        })
                        .ToArray()
                })
                .ToArray()
        };
}
