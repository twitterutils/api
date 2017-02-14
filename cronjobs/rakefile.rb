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

def read_env_variables_list
    all_env_variables_raw = run_s "heroku config --app twu-api --shell | grep -v TWU_API"
    all_env_variables_raw.split
end

def generate_copy_vars(vars_list)
    all_var_names = vars_list
        .map { |kvstr| kvstr.split("=")[0] }
        .join(",")
    "COPY_ENV_VARS=#{all_var_names}"
end

task :env => [:cleanup, :env_file, :env_cmd] do
end

task :env_file do
    all_env_variables_list = read_env_variables_list

    env_variables = all_env_variables_list
        .map { |kvstr| kvstr.split("=") }
        .map { |kvp| [kvp[0], kvp[1].chomp("'").reverse.chomp("'").reverse] }
        .map { |kvp| "#{kvp[0]}=#{kvp[1]}" }
    # puts env_variables

    File.open(ENV_FILE_NAME, 'w') do |f|
        f.puts "TASK_SCHEDULE=*/10 * * * *"
        f.puts generate_copy_vars(env_variables)

        env_variables.each { |l|
            f.puts l
        }
    end

    # puts `cat #{ENV_FILE_NAME}`
end

task :env_cmd do
    # all_env_variables_list = read_env_variables_list
end

task :cleanup do
    `rm -f #{ENV_FILE_NAME}`
end