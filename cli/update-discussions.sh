
# table=$(aws dynamodb list-tables | jq -r '.TableNames[] | select(test("Discussion-.*roxana"))')
# ids=$(aws dynamodb scan --table-name $table \
#   --filter-expression "updatedAt > :yesterday" \
#   --expression-attribute-values '{":yesterday":{"S":"2022-04-24"}}' \
#   | jq -r '.Items[] | .id.S | select(test("^\\d+$"))')

# for id in $ids; do
#   echo deleting $id
#   key=$(printf '{"id":{"S":"%s"}}' $id)
#   aws dynamodb delete-item --table-name $table --key "$key"
# done

  # --filter-expression "updatedAt > :yesterday" \
  # --expression-attribute-values '{":yesterday":{"S":"2022-04-24"}}' \

# read -rd '' json <<EOF
# {
#     key1: "$env_var1",
#     key2: "$env_var2"
# }
# EOF
# echo "$json"

# ids=$(aws dynamodb scan --table-name $table \
#   | jq -r '.Items[] | .id.S | select(test("^\\d+$"))')
