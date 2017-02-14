ENV_FILE_NAME = ".env-prod"

def run_s(command)
    run(command, true)
end

def run(command, silent = false)
    puts "sh #{command}"
    command_output = `#{command}`
    puts command_output unless silent
    raise "Error Running Command" unless $?.success?
    command_output
end

task :env => [:cleanup] do
    all_env_variables_raw = run_s "heroku config --app twu-api --shell | grep -v TWU_API"

    var_names = all_env_variables_raw.split.map { |kvstr| kvstr.split("=")[0] }.join(",")

    File.open(ENV_FILE_NAME, 'w') do |f|
        f.puts "TASK_SCHEDULE=* * * * 10"
        f.puts "COPY_ENV_VARS=#{var_names}"
        f.puts all_env_variables_raw
    end

    # puts `cat #{ENV_FILE_NAME}`
end

task :cleanup do
    `rm -f #{ENV_FILE_NAME}`
end