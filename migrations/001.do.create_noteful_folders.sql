create table noteful_folders (
    id integer primary key generated by default as identity,
    folder_name text unique not null
);