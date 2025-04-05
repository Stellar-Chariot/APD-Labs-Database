$gitPath = 'C:\Program Files\Git\bin\git.exe'
& $gitPath config --global user.email "jburritt@live.com"
& $gitPath config --global user.name "John Burritt"
& $gitPath add .
& $gitPath commit -m "Initial working version with simulated backend" 