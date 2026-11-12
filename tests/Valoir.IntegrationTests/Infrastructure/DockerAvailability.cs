using System.Diagnostics;

namespace Valoir.IntegrationTests.Infrastructure;

/// <summary>
/// Detects Docker for Testcontainers.
/// Local: tests may soft-skip when Docker is missing (unless VALOIR_REQUIRE_DOCKER=1).
/// CI: set VALOIR_REQUIRE_DOCKER=1 so missing Docker fails the suite instead of silent success.
/// </summary>
public static class DockerAvailability
{
    private static readonly Lazy<bool> _available = new(Probe);

    public static bool IsAvailable => _available.Value;

    public static bool RequireDocker =>
        string.Equals(Environment.GetEnvironmentVariable("VALOIR_REQUIRE_DOCKER"), "1", StringComparison.Ordinal)
        || string.Equals(Environment.GetEnvironmentVariable("CI"), "true", StringComparison.OrdinalIgnoreCase);

    public static string SkipReason =>
        "Docker is not available. Set up Docker or run in CI with VALOIR_REQUIRE_DOCKER=1.";

    /// <summary>Throws if Docker is required but unavailable (CI mode).</summary>
    public static void EnsureAvailableOrThrow()
    {
        if (!IsAvailable && RequireDocker)
            throw new InvalidOperationException(
                "Docker is required for integration tests (VALOIR_REQUIRE_DOCKER=1 or CI=true) but is not available.");
    }

    private static bool Probe()
    {
        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = "docker",
                Arguments = "info",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            using var p = Process.Start(psi);
            if (p is null) return false;
            if (!p.WaitForExit(8000))
            {
                try { p.Kill(); } catch { /* ignore */ }
                return false;
            }
            return p.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }
}
