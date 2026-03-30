namespace Demo.Auth.Core.Models
{
    public enum LoginStatus
    {
        Success,
        InvalidCredentials,
        Inactive,
        Locked
    }

    public class LoginResult
    {
        public LoginStatus Status { get; set; }
        public int? UserId { get; set; }
        public string Email { get; set; }

        public static LoginResult Success(int userId, string email)
            => new LoginResult { Status = LoginStatus.Success, UserId = userId, Email = email };

        public static LoginResult InvalidCredentials()
            => new LoginResult { Status = LoginStatus.InvalidCredentials };

        public static LoginResult Inactive()
            => new LoginResult { Status = LoginStatus.Inactive };

        public static LoginResult Locked()
            => new LoginResult { Status = LoginStatus.Locked };
    }
}
