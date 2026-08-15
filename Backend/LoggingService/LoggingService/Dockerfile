FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["LoggingService.csproj", "./"]
RUN dotnet restore "LoggingService.csproj"
COPY . .
RUN dotnet publish "LoggingService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8086
EXPOSE 8086
ENTRYPOINT ["dotnet", "LoggingService.dll"]
