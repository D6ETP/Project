using LoggingService.Models;
using LoggingService.Services;
using Microsoft.AspNetCore.Mvc;

namespace LoggingService.Controllers
{
    [ApiController]
    [Route("logs")]
    public class LogsController : ControllerBase
    {
        private readonly FileLoggerService _fileLoggerService;

        public LogsController(FileLoggerService fileLoggerService)
        {
            _fileLoggerService = fileLoggerService;
        }

        // POST /logs/operation — log a user operation
        [HttpPost("operation")]
        public async Task<IActionResult> LogOperation([FromBody] OperationLogRequest request)
        {
            if (request == null) return BadRequest(new { message = "Log payload cannot be null" });
            
            var entry = await _fileLoggerService.LogOperationAsync(request);
            return Ok(new { message = "Operation logged successfully", logId = entry.LogId });
        }

        // POST /logs/error — log a user error / exception
        [HttpPost("error")]
        public async Task<IActionResult> LogError([FromBody] ErrorLogRequest request)
        {
            if (request == null) return BadRequest(new { message = "Log payload cannot be null" });

            var entry = await _fileLoggerService.LogErrorAsync(request);
            return Ok(new { message = "Error logged successfully", logId = entry.LogId });
        }

        // GET /logs/operations — view recent operation log lines
        [HttpGet("operations")]
        public async Task<IActionResult> GetOperationLogs([FromQuery] int limit = 100)
        {
            var logs = await _fileLoggerService.GetRecentOperationLogsAsync(limit);
            return Ok(new { total = logs.Count, logs });
        }

        // GET /logs/errors — view recent error log lines
        [HttpGet("errors")]
        public async Task<IActionResult> GetErrorLogs([FromQuery] int limit = 100)
        {
            var logs = await _fileLoggerService.GetRecentErrorLogsAsync(limit);
            return Ok(new { total = logs.Count, logs });
        }

        // GET /logs/summary — view summary stats of log files
        [HttpGet("summary")]
        public IActionResult GetSummary()
        {
            var summary = _fileLoggerService.GetSummary();
            return Ok(summary);
        }
    }
}
