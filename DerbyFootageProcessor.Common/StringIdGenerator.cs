using System.Security.Cryptography;

namespace DerbyFootageProcessor.Common;

public static class StringId
{
    public static string Generate(int length = 12) =>
        RandomNumberGenerator.GetString(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            length);
}