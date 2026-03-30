using System.Threading.Tasks;

namespace Demo.Auth.Core.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;

        public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<LoginResult> LoginAsync(string email, string password)
        {
            var user = await _userRepository.FindByEmailAsync(email);
            if (user == null)
                return LoginResult.InvalidCredentials();

            if (!user.IsActive)
                return LoginResult.Inactive();

            if (user.FailedLoginAttempts >= 5)
                return LoginResult.Locked();

            var validPassword = _passwordHasher.Verify(user.PasswordHash, password);
            if (!validPassword)
            {
                user.FailedLoginAttempts += 1;
                await _userRepository.UpdateAsync(user);

                if (user.FailedLoginAttempts >= 5)
                    return LoginResult.Locked();

                return LoginResult.InvalidCredentials();
            }

            user.FailedLoginAttempts = 0;
            await _userRepository.UpdateAsync(user);

            return LoginResult.Success(user.Id, user.Email);
        }
    }
}
