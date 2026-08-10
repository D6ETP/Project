using System.Text;
using LoggingService.Models;

namespace LoggingService.Services
{
    public class FileLoggerService
    {
        private readonly string _logsDirectory;
        private static readonly SemaphoreSlim _fileLock = new SemaphoreSlim(1, 1);

        public FileLoggerService(IWebHostEnvironment env)
        {
            _logsDirectory = Path.Combine(env.ContentRootPath, "logs");
            if (!Directory.Exists(_logsDirectory))
            {
                Directory.CreateDirectory(_logsDirectory);
            }
        }

        // Returns path to today's single log file: easytravel-logs-YYYY-MM-DD.log
        private string GetTodayLogFilePath()
        {
            string dateStamp = DateTime.UtcNow.ToString("yyyy-MM-dd");
            return Path.Combine(_logsDirectory, $"easytravel-logs-{dateStamp}.log");
        }

        public async Task<LogEntry> LogOperationAsync(OperationLogRequest req)
        {
            var entry = new LogEntry
            {
                LogId = Guid.NewGuid().ToString("N")[..8],
                Timestamp = DateTime.UtcNow,
                LogType = "OPERATION",
                LogLevel = req.StatusCode >= 400 ? "WARN" : "INFO",
                UserId = req.UserId ?? "ANONYMOUS",
                Username = req.Username ?? "guest",
                Role = req.Role ?? "ROLE_USER",
                HttpMethod = req.HttpMethod.ToUpper(),
                Endpoint = req.Endpoint,
                StatusCode = req.StatusCode,
                Message = req.Description ?? $"User '{req.Username ?? "guest"}' executed {req.HttpMethod} {req.Endpoint}",
                ClientIp = req.ClientIp ?? "127.0.0.1",
                ExecutionTimeMs = req.ResponseTimeMs
            };

            string formattedLine = $"[{entry.Timestamp:yyyy-MM-dd HH:mm:ss.fff UTC}] [{entry.LogLevel}] [USER:{entry.UserId}|{entry.Username}|{entry.Role}] [IP:{entry.ClientIp}] [{entry.HttpMethod} {entry.Endpoint}] [STATUS:{entry.StatusCode}] [{entry.ExecutionTimeMs}ms] - {entry.Message}";

            await WriteToFileAsync(GetTodayLogFilePath(), formattedLine);

            Console.WriteLine($"📝 [OPERATION LOG] {formattedLine}");
            return entry;
        }

        public async Task<LogEntry> LogErrorAsync(ErrorLogRequest req)
        {
            var entry = new LogEntry
            {
                LogId = Guid.NewGuid().ToString("N")[..8],
                Timestamp = DateTime.UtcNow,
                LogType = "ERROR",
                LogLevel = "ERROR",
                UserId = req.UserId ?? "ANONYMOUS",
                Username = req.Username ?? "guest",
                Role = req.Role ?? "ROLE_USER",
                HttpMethod = req.HttpMethod.ToUpper(),
                Endpoint = req.Endpoint,
                StatusCode = req.StatusCode,
                Message = req.ErrorMessage,
                Details = string.IsNullOrEmpty(req.StackTrace) ? req.ExceptionType : $"{req.ExceptionType}: {req.StackTrace}",
                ClientIp = req.ClientIp ?? "127.0.0.1"
            };

            string formattedLine = $"[{entry.Timestamp:yyyy-MM-dd HH:mm:ss.fff UTC}] [ERROR] [USER:{entry.UserId}|{entry.Username}|{entry.Role}] [IP:{entry.ClientIp}] [{entry.HttpMethod} {entry.Endpoint}] [STATUS:{entry.StatusCode}] - ERROR: {entry.Message}";
            if (!string.IsNullOrEmpty(entry.Details))
            {
                formattedLine += $" | DETAILS: {entry.Details}";
            }

            await WriteToFileAsync(GetTodayLogFilePath(), formattedLine);

            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"🚨 [ERROR LOG] {formattedLine}");
            Console.ResetColor();

            return entry;
        }

        public async Task<List<string>> GetRecentOperationLogsAsync(int limit = 100)
        {
            var lines = await ReadAllCurrentLogLinesAsync();
            return lines.Where(l => l.Contains("[INFO]") || l.Contains("[WARN]")).Reverse().Take(limit).ToList();
        }

        public async Task<List<string>> GetRecentErrorLogsAsync(int limit = 100)
        {
            var lines = await ReadAllCurrentLogLinesAsync();
            return lines.Where(l => l.Contains("[ERROR]")).Reverse().Take(limit).ToList();
        }

        public LogSummaryResponse GetSummary()
        {
            var todayFile = GetTodayLogFilePath();
            int opsCount = 0;
            int errCount = 0;

            if (File.Exists(todayFile))
            {
                foreach (var line in File.ReadLines(todayFile))
                {
                    if (line.Contains("[ERROR]")) errCount++;
                    else if (line.Contains("[INFO]") || line.Contains("[WARN]")) opsCount++;
                }
            }

            return new LogSummaryResponse
            {
                TotalOperationsLogged = opsCount,
                TotalErrorsLogged = errCount,
                OperationsLogFilePath = todayFile,
                ErrorsLogFilePath = todayFile,
                ServerTime = DateTime.UtcNow
            };
        }

        private async Task WriteToFileAsync(string filePath, string line)
        {
            await _fileLock.WaitAsync();
            try
            {
                using var writer = new StreamWriter(filePath, append: true, encoding: Encoding.UTF8);
                await writer.WriteLineAsync(line);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to write to log file '{filePath}': {ex.Message}");
            }
            finally
            {
                _fileLock.Release();
            }
        }

        private async Task<List<string>> ReadAllCurrentLogLinesAsync()
        {
            var todayFile = GetTodayLogFilePath();
            if (!File.Exists(todayFile)) return new List<string>();

            await _fileLock.WaitAsync();
            try
            {
                return (await File.ReadAllLinesAsync(todayFile, Encoding.UTF8)).ToList();
            }
            catch
            {
                return new List<string>();
            }
            finally
            {
                _fileLock.Release();
            }
        }
    }
}
