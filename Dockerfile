FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/Valoir.WebApi/Valoir.WebApi.csproj", "src/Valoir.WebApi/"]
COPY ["src/Valoir.Application/Valoir.Application.csproj", "src/Valoir.Application/"]
COPY ["src/Valoir.Domain/Valoir.Domain.csproj", "src/Valoir.Domain/"]
COPY ["src/Valoir.Infrastructure/Valoir.Infrastructure.csproj", "src/Valoir.Infrastructure/"]

RUN dotnet restore "src/Valoir.WebApi/Valoir.WebApi.csproj"

COPY . .
WORKDIR "/src/src/Valoir.WebApi"
RUN dotnet publish "Valoir.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Valoir.WebApi.dll"]
