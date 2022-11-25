dotnet publish -r osx-x64 -c Release /p:PublishSingleFile=true /p:PublishTrimmed=true /p:EnableCompressionInSingleFile=true
cp bin/Release/net6.0/osx-x64/publish/UMC.Host /Users/wushunming/Documents/APIUMC/MPorxy/osx-x64/MProxy


dotnet publish -r linux-x64 -c Release /p:PublishSingleFile=true /p:PublishTrimmed=true /p:EnableCompressionInSingleFile=true
cp bin/Release/net6.0/linux-x64/publish/UMC.Host /Users/wushunming/Documents/APIUMC/MPorxy/linux-x64/MProxy

dotnet publish -r linux-arm -c Release /p:PublishSingleFile=true /p:PublishTrimmed=true /p:EnableCompressionInSingleFile=true
cp bin/Release/net6.0/linux-arm/publish/UMC.Host /Users/wushunming/Documents/APIUMC/MPorxy/linux-arm/MProxy

dotnet publish -r linux-musl-x64 -c Release /p:PublishSingleFile=true /p:PublishTrimmed=true /p:EnableCompressionInSingleFile=true
cp bin/Release/net6.0/linux-musl-x64/publish/UMC.Host /Users/wushunming/Documents/APIUMC/MPorxy/linux-musl-x64/MProxy

dotnet publish -r linux-arm64 -c Release /p:PublishSingleFile=true /p:PublishTrimmed=true /p:EnableCompressionInSingleFile=true
cp bin/Release/net6.0/linux-arm64/publish/UMC.Host /Users/wushunming/Documents/APIUMC/MPorxy/linux-arm64/MProxy

dotnet publish -r win-arm64 -c Release /p:PublishSingleFile=true /p:PublishTrimmed=true /p:EnableCompressionInSingleFile=true
cp bin/Release/net6.0/win-arm64/publish/UMC.Host.exe /Users/wushunming/Documents/APIUMC/MPorxy/win-arm64/MProxy.exe

dotnet publish -r win-arm -c Release /p:PublishSingleFile=true /p:PublishTrimmed=true /p:EnableCompressionInSingleFile=true
cp bin/Release/net6.0/win-arm/publish/UMC.Host.exe /Users/wushunming/Documents/APIUMC/MPorxy/win-arm/MProxy.exe

dotnet publish -r win-x64 -c Release /p:PublishSingleFile=true /p:PublishTrimmed=true /p:EnableCompressionInSingleFile=true
cp bin/Release/net6.0/win-x64/publish/UMC.Host.exe /Users/wushunming/Documents/APIUMC/MPorxy/win-x64/MProxy.exe


dotnet publish -r win-x86 -c Release /p:PublishSingleFile=true /p:PublishTrimmed=true /p:EnableCompressionInSingleFile=true
cp bin/Release/net6.0/win-x86/publish/UMC.Host.exe /Users/wushunming/Documents/APIUMC/MPorxy/win-x86/MProxy.exe
PATH=/opt:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/bin