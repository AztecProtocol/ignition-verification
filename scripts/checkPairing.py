import json
import sys
import pprint

from py_ecc import bn128

from py_ecc.bn128.bn128_curve import (
    G2,
)

from py_ecc.fields import (
    bn128_FQ as FQ,
    bn128_FQ2 as FQ2,
    bn128_FQ12 as FQ12,
)

def check_pairing(participantG1, participantG2, previousParticipantG1):
    # G1 point for participant
    participant_g1_x = FQ(int(participantG1['x']))
    participant_g1_y = FQ(int(participantG1['y']))

    participant_g1 = (participant_g1_x, participant_g1_y)

    # G2 point for participant
    participant_g2_x = FQ2([int(participantG2['x']['c0']), int(participantG2['x']['c1'])])
    participant_g2_y = FQ2([int(participantG2['y']['c0']), int(participantG2['y']['c1'])])

    participant_g2 = (participant_g2_x, participant_g2_y)

    # G1 point for previous participant
    previous_participant_g1_x = FQ(int(previousParticipantG1['x']))
    previous_participant_g1_y = FQ(int(previousParticipantG1['y']))

    previous_participant_g1 = (previous_participant_g1_x, previous_participant_g1_y)

    e1 = bn128.final_exponentiate(bn128.pairing(G2, participant_g1))
    e2 = bn128.final_exponentiate(bn128.pairing(participant_g2, previous_participant_g1))

    pairing_result = (e1 == e2)

    assert(pairing_result == True)

with open('points.json') as json_file:
    data = json.load(json_file)
    points = data['points']
    participant_indices = data['addressToIndex']
    participant_addresses = list(participant_indices.keys())

    ## If participant is passed in, check previous, next all in sequence
    if len(sys.argv) > 1:
        participant_address = sys.argv[1]
        # Will fail here if supplied address not in list
        participant_index = participant_indices[participant_address]
        participant_points = points[participant_address]

        if participant_index - 1 > 0:
            previous_participant_address = participant_addresses[participant_index - 1]
            previous_participant_points = points[previous_participant_address]
            # Will throw an exception if pairing check fails
            print("\nValidating that contribution from {} builds on {}...".format(participant_address, previous_participant_address))
            print("\n{} G1 first point:".format(participant_address))
            pprint.pprint(participant_points['g1'])
            print("\n{} G2 first point:".format(participant_address))
            pprint.pprint(participant_points['g2'])
            print("\n{} G1 first point:".format(previous_participant_address))
            pprint.pprint(previous_participant_points['g1'])
            check_pairing(participant_points['g1'], participant_points['g2'], previous_participant_points['g1'])
            print("\nSuccess! e(G2_generator, current_participant_first_g1) == e(current_participant_g2, previous_participant_first_g1)")
            print("\n –––––––––––––––––––––––– \n")

        if participant_index + 1 < len(participant_addresses):
            next_participant_address = participant_addresses[participant_index + 1]
            next_participant_points = points[next_participant_address]
            print("Validating that contribution from {} is built on by {}...".format(participant_address, next_participant_address))
            print("\n{} G1 first point:".format(next_participant_address))
            pprint.pprint(next_participant_points['g1'])
            print("\n{} G2 first point:".format(next_participant_address))
            pprint.pprint(next_participant_points['g2'])
            print("\n{} G1 first point:".format(participant_address))
            pprint.pprint(participant_points['g1'])
            check_pairing(next_participant_points['g1'], next_participant_points['g2'], participant_points['g1'])
            print("\nSuccess! e(G2_generator, next_participant_first_g1) == e(next_participant_g2, current_participant_first_g1)")
    else:
        print("Please input the address of the participant you want to validate.")
