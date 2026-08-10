namespace LoggingService.Models
{
    public class OperationLogRequest
    {
        public string? UserId { get; set; }
        public string? Username { get; set; }
        public string? Role { get; set; }
        public string HttpMethod { get; set; } = "GET";
        public string Endpoint { get; set; } = "";
        public int StatusCode { get; set; } = 200;
        public string? Description { get; set; }
        public string? ClientIp { get; set; }
        public long ResponseTimeMs { get; set; }
    }

    public class ErrorLogRequest
    {
        public string? UserId { get; set; }
        public string? Username { get; set; }
        public string? Role { get; set; }
        public string HttpMethod { get; set; } = "GET";
        public string Endpoint { get; set; } = "";
        public int StatusCode { get; set; } = 500;
        public string ErrorMessage { get; set; } = "";
        public string? ExceptionType { get; set; }
        public string? StackTrace { get; set; }
        public string? ClientIp { get; set; }
    }

    public class LogEntry
    {
        public string LogId { get; set; } = Guid.NewGuid().ToString();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string LogType { get; set; } = "OPERATION"; // "OPERATION" or "ERROR"
        public string LogLevel { get; set; } = "INFO"; // "INFO", "WARN", "ERROR"
        public string? UserId { get; set; }
        public string? Username { get; set; }
        public string? Role { get; set; }
        public string HttpMethod { get; set; } = "";
        public string Endpoint { get; set; } = "";
        public int StatusCode { get; set; }
        public string Message { get; set; } = "";
        public string? Details { get; set; }
        public string? ClientIp { get; set; }
        public long ExecutionTimeMs { get; set; }
    }

    public class LogSummaryResponse
    {
        public int TotalOperationsLogged { get; set; }
        public int TotalErrorsLogged { get; set; }
        public string OperationsLogFilePath { get; set; } = "";
        public string ErrorsLogFilePath { get; set; } = "";
        public DateTime ServerTime { get; set; } = DateTime.UtcNow;
    }
}
