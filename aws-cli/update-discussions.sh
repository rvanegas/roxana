
set_table() {
  env=pebbles
  discussion_table=$(aws dynamodb list-tables | jq -r ".TableNames[] | select(test(\"Discussion-.*$env\"))")
  sentence_table=$(aws dynamodb list-tables | jq -r ".TableNames[] | select(test(\"Discussion-.*$env\"))")
}

set_ids() {
  ids=$( \
    aws dynamodb scan --table-name $discussion_table \
      | jq -r '.Items[] | .id.S'
#     | jq -r '.propositions[] | .id'
  )

  # key=$(printf '{"id":{"S":"%s"}}' $id)
  # aws dynamodb get-item --table-name $sentence_table --key '{}' \
  # | jq -r '.' \
  # | jq -r '.Count'
  # | jq -r '.Items[] | if (.layout.S | length) < 35 then .id.S else "" end'
  # --filter-expression "attribute_not_exists(isPrivate)" \
  # --filter-expression "isPrivate = :value" \
  # --expression-attribute-values '{":value":{"BOOL":true}}' \
}

# set_empty_discussions() {
#   for id in $ids; do
#   done
# }

update_items() {
  for id in $ids; do
    echo updating $id
    key=$(printf '{"id":{"S":"%s"}}' $id)
    update="SET isPrivate = :value"
    values='{":value":{"BOOL":false}}'
    aws dynamodb update-item --table-name $table --key "$key" \
      --update-expression "$update" --expression-attribute-values "$values"
      # --return-values ALL_NEW
  done
}

delete_items() {
  for id in $ids; do
    echo deleting $id
    key=$(printf '{"id":{"S":"%s"}}' $id)
    aws dynamodb delete-item --table-name $discussion_table --key "$key"
  done
}

# set_table
# ids=""
# delete_items

# set_ids
# echo $ids
# echo $discussion_table

# delete_items
# exit
#
# read -rd '' json <<EOF
# {
#     key1: "$env_var1",
#     key2: "$env_var2"
# }
# EOF
# echo "$json"
#
# ids=$(aws dynamodb scan --table-name $table \
#   | jq -r '.Items[] | .id.S | select(test("^\\d+$"))')
#
# aws appsync list-types --api-id bqkpkb6pszhoxpd3urdmd775km --format JSON --no-paginate | jq '.types[]'
