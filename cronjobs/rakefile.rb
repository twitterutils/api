task :default => [:e]

ENV_FILE_NAME = ".env-prod"
ENV_ALL_FILE_NAME = ".env-prod-all"
ENV_COMMAND_FILE_NAME = ".env-prod-cmd"

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

def read_all_env_variables_list
    read_env_variables_list true
end

def read_env_variables_list(read_all=false)
    ignore_api_vars_str = "| grep -v TWU_API"

    if read_all 
        ignore_api_vars_str = ""
    end

    all_env_variables_raw = run_s "heroku config --app twu-api --shell #{ignore_api_vars_str}"
    all_env_variables_raw.split
end

def get_all_var_names(vars_list)
    vars_list
        .map { |kvstr| kvstr.split("=")[0] }
        .join(",")
end

def env_var(name, value, enclose_value_in_quotes)
    value_str = value
    if enclose_value_in_quotes then
        value_str="'#{value}'"
    end

    "#{name}=#{value_str}"
end

def generate_copy_vars(vars_list, enclose_value_in_quotes=false)
    env_var("COPY_ENV_VARS", get_all_var_names(vars_list), enclose_value_in_quotes)
end

def generate_task_schedule(enclose_value_in_quotes=false)
    env_var("TASK_SCHEDULE", "0,15,30,45 * * * *", enclose_value_in_quotes)
end

def generate_environment_file(output_filename, env_variables_list)
    env_variables = env_variables_list
        .map { |kvstr| kvstr.split("=") }
        .map { |kvp| [kvp[0], kvp[1].chomp("'").reverse.chomp("'").reverse] }
        .map { |kvp| "#{kvp[0]}=#{kvp[1]}" }
    # puts env_variables

    File.open(output_filename, 'w') do |f|
        f.puts generate_task_schedule
        f.puts generate_copy_vars(env_variables)

        env_variables.each { |l|
            f.puts l
        }
    end

    # puts `cat #{output_filename}`
end

task :e => :env
task :env => [:cleanup, :env_file, :env_cmd, :env_all] do
end

task :env_file do
    all_env_variables_list = read_env_variables_list
    generate_environment_file(ENV_FILE_NAME, all_env_variables_list)
end

task :env_all do
    all_env_variables_list = read_all_env_variables_list
    generate_environment_file(ENV_ALL_FILE_NAME, all_env_variables_list)
end

task :env_cmd do
    all_env_variables_list = read_env_variables_list

    env_var_lines = []
    env_var_lines.push generate_task_schedule(true)
    env_var_lines.push generate_copy_vars(all_env_variables_list, true)
    all_env_variables_list.each { |l| env_var_lines.push l }

    env_cmd_text = env_var_lines
        .map { |l| "--env #{l}" }
        .join(" ")

    File.open(ENV_COMMAND_FILE_NAME, 'w') do |f|
        f.write env_cmd_text
    end
end

task :c => :cleanup
task :cleanup do
    `rm -f #{ENV_FILE_NAME}`
    `rm -f #{ENV_COMMAND_FILE_NAME}`
end